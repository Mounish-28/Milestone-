from fastapi import APIRouter, Depends
import os
from pydantic import BaseModel
from sqlalchemy.orm import Session
try:
    from database import get_db
    from models import Product
except ImportError:
    from app.database import get_db
    from app.models import Product

router = APIRouter(prefix="/rag-assistant", tags=["RAG AI Shopping Assistant"])

class ChatQuery(BaseModel):
    query: str

@router.post("/chat")
def rag_chat(payload: ChatQuery, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "query": payload.query,
            "response": "Based on our catalog, the Samsung S24 Ultra is a great choice! (Simulated RAG response - no API key found).",
            "products_retrieved": []
        }
    
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.schema import Document
        from langchain_community.vectorstores import FAISS
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        from langchain.chains.combine_documents import create_stuff_documents_chain
        from langchain_core.prompts import ChatPromptTemplate
        from langchain.chains import create_retrieval_chain
        
        # 1. Prepare Document Corpus from Database
        products = db.query(Product).all()
        documents = []
        for p in products:
            doc_text = f"Product: {p.name}. Category: {p.category}. Price: ${p.price}. Description: {p.description}. In Stock: {p.stock_quantity}"
            documents.append(Document(page_content=doc_text, metadata={"id": p.id, "name": p.name}))
            
        # 2. Embeddings and Vector Store
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
        vector_store = FAISS.from_documents(documents, embeddings)
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        
        # 3. LLM Setup
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key, temperature=0.3)
        
        # 4. RAG Prompt
        prompt = ChatPromptTemplate.from_template(
            """You are a helpful e-commerce AI Shopping Assistant.
Answer the user's question accurately based ONLY on the provided product catalog context. 
If the information is not in the context, politely say you don't know or don't have that product.

Context:
{context}

Question: {input}
Answer:"""
        )
        
        # 5. Chain Execution
        document_chain = create_stuff_documents_chain(llm, prompt)
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        response = retrieval_chain.invoke({"input": payload.query})
        
        # Extract the retrieved products for reference
        retrieved_products = [doc.metadata["name"] for doc in response.get("context", [])]
        
        return {
            "query": payload.query,
            "response": response.get("answer", ""),
            "products_retrieved": retrieved_products
        }
    except Exception as e:
        return {"error": str(e), "response": "Sorry, I had trouble finding relevant products right now."}
