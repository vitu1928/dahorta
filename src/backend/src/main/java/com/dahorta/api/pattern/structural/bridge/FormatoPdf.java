package com.dahorta.api.pattern.structural.bridge;

import java.nio.charset.StandardCharsets;
import java.util.List;

/** Padrão GoF: Bridge */
public final class FormatoPdf implements FormatoExportacao {
    @Override
    public ResultadoExportacao exportar(List<LinhaRelatorioVendas> linhas) {
        String texto = "Relatorio de vendas\n" + linhas.stream()
                .map(linha -> "Pedido " + linha.pedidoId() + " | " + linha.status()
                        + " | R$ " + linha.total())
                .reduce("", (acumulado, linha) -> acumulado + linha + "\n");
        return new ResultadoExportacao("relatorio-vendas.pdf", "application/pdf",
                criarPdf(texto).getBytes(StandardCharsets.US_ASCII));
    }

    private String criarPdf(String texto) {
        String conteudo = "BT /F1 10 Tf 50 780 Td (" + escapar(texto)
                .replace("\\n", ") Tj 0 -14 Td (") + ") Tj ET";
        String[] objetos = {
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources "
                        + "<< /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
                "<< /Length " + conteudo.length() + " >>\nstream\n" + conteudo + "\nendstream"
        };
        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        int[] offsets = new int[objetos.length + 1];
        for (int i = 0; i < objetos.length; i++) {
            offsets[i + 1] = pdf.length();
            pdf.append(i + 1).append(" 0 obj\n").append(objetos[i]).append("\nendobj\n");
        }
        int inicioXref = pdf.length();
        pdf.append("xref\n0 ").append(offsets.length).append("\n0000000000 65535 f \n");
        for (int i = 1; i < offsets.length; i++) {
            pdf.append(String.format("%010d 00000 n \n", offsets[i]));
        }
        return pdf.append("trailer\n<< /Size ").append(offsets.length)
                .append(" /Root 1 0 R >>\nstartxref\n").append(inicioXref).append("\n%%EOF\n").toString();
    }

    private String escapar(String texto) {
        return texto.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
                .replace("\r", "").replace("\n", "\\n");
    }
}
