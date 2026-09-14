from fastapi import APIRouter, Depends
import os
from pydantic import BaseModel

router = APIRouter(prefix="/data-analyst", tags=["AI Data Analyst (Text-to-SQL)"])

class AnalystQuery(BaseModel):
    query: str
    vendor_id: int | None = None

@router.post("/ask")
def ask_data_analyst(payload: AnalystQuery):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # Fallback to simulated response if no API key
        return {
            "query": payload.query,
            "sql_generated": "SELECT SUM(amount) FROM transactions WHERE vendor_id = ? AND created_at >= date('now', '-7 days')",
            "result": "Looks like you made $3,450 last week! Great job on electronics sales.",
            "note": "Simulated Text-to-SQL response because no Gemini API key was found in the environment."
        }
    
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_community.utilities import SQLDatabase
        from langchain.chains import create_sql_query_chain
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, "shopsense.db")
        db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
        
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key, temperature=0.1)
        chain = create_sql_query_chain(llm, db)
        
        prompt_modifier = payload.query
        if payload.vendor_id:
            prompt_modifier += f" ONLY consider data where vendor_id = {payload.vendor_id}."
            
        sql_query = chain.invoke({"question": prompt_modifier})
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        
        # Execute query safely
        result = db.run(sql_query)
        
        # Generate natural language response
        interpretation_prompt = f"The user asked: {payload.query}. The database query was: {sql_query}. The database result was: {result}. Write a short, friendly, natural language answer for the vendor."
        final_answer = llm.invoke(interpretation_prompt)
        
        return {
            "query": payload.query,
            "sql_generated": sql_query,
            "result": final_answer.content
        }
    except Exception as e:
        return {"error": str(e)}
