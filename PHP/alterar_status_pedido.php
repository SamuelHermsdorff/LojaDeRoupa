<?php
// Cabeçalhos para permitir requisições de outros domínios (CORS) e indicar que a resposta será em JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

include 'db_connect.php';

// Verifica se a requisição é do tipo POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Captura o corpo da requisição
    $data = json_decode(file_get_contents('php://input'), true);

    // Verifica se os dados 'id' e 'status' estão presentes na requisição
    if (isset($data['id']) && isset($data['status'])) {
        $id = $data['id'];         // ID do pedido
        $status = $data['status']; // Novo status do pedido

        // Conexão com o banco de dados (ajuste conforme suas credenciais)
        //$conn = new mysqli('localhost', 'root', '', 'identidadeproject');

        // Verifica se a conexão foi bem-sucedida
        if ($conn->connect_error) {
            die(json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error]));
        }

        // Prepara a consulta para atualizar o status do pedido
        $stmt = $conn->prepare("UPDATE Pedidos SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $id); // "si" significa string (status) e inteiro (id)

        // Executa a consulta
        if ($stmt->execute()) {
            // Retorna sucesso se a execução foi bem-sucedida
            echo json_encode(['status' => 'sucesso']);
        } else {
            // Retorna erro se houve falha ao executar a consulta
            echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao atualizar status: ' . $stmt->error]);
        }

        // Fecha a conexão
        $stmt->close();
        $conn->close();
    } else {
        // Retorna erro caso os parâmetros não tenham sido passados corretamente
        echo json_encode(['status' => 'erro', 'mensagem' => 'Parâmetros inválidos ou ausentes']);
    }
} else {
    // Retorna erro caso a requisição não seja do tipo POST
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método HTTP inválido']);
}
?>
