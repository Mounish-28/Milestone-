import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportPDF(data) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ShopSense Customer Receipt", 14, 20);
    autoTable(doc, {
        head: [["ID", "Name", "Email"]],
        body: data.map(item => [
            item.id,
            item.name,
            item.email
        ])
    });
    doc.save("shopsense_order_receipt.pdf");
}

export function exportExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Orders"
    );
    XLSX.writeFile(workbook, "shopsense_orders.xlsx");
}

export function exportCSV(data){
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv],{
        type:"text/csv;charset=utf-8;"
    });
    saveAs(blob,"shopsense_orders.csv");
}
