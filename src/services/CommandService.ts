import { FILE_API_BASE_URL } from "@/config/api";

export interface CommandResponse {
    success: boolean;
    stdout: string;
    stderr: string;
    error?: string;
}

export const triggerRemoteCommand = async (command: string, secretKey: string): Promise<CommandResponse> => {
    try {
        const response = await fetch(`${FILE_API_BASE_URL}/api/system/command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ command, secretKey }),
        });

        if (!response.ok) {
            // Tentar capturar o json de erro, ou retorna texto genérico
            let errorText = "Erro na requisição";
            try {
                const errorData = await response.json();
                if (errorData.error) errorText = errorData.error;
            } catch (e) {
                errorText = `Erro HTTP: ${response.status}`;
            }
            return { success: false, stdout: "", stderr: errorText };
        }

        const data: CommandResponse = await response.json();
        return data;
    } catch (error: any) {
        console.error("Erro ao engatilhar comando remoto:", error);
        return {
            success: false,
            stdout: "",
            stderr: error.message || "Erro desconhecido de rede",
        };
    }
};
