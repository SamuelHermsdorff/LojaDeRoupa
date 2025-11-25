<?php
session_start();
require 'db_connect.php';

// Importa as classes do PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carrega os arquivos do PHPMailer
require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email_reset'] ?? '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "erro", "mensagem" => "Por favor, digite um e-mail válido."]);
        exit();
    }

    // 1. Verificar se o e-mail existe
    $stmt = $conn->prepare("SELECT id, nome FROM Usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $usuario = $resultado->fetch_assoc();
        
        // 2. Gerar um token de reset seguro
        $token = bin2hex(random_bytes(32)); // 64 caracteres
        
        // 3. Definir tempo de expiração (ex: 1 hora)
        $expira = new DateTime();
        $expira->add(new DateInterval('PT1H')); // 1 hora a partir de agora
        $expira_formatado = $expira->format('Y-m-d H:i:s');

        // 4. Salvar o token e a data de expiração no banco
        $stmt_update = $conn->prepare("UPDATE Usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $stmt_update->bind_param("ssi", $token, $expira_formatado, $usuario['id']);
        
        if ($stmt_update->execute()) {
            
            // 5. Enviar o e-mail com PHPMailer
            $mail = new PHPMailer(true);
            
            // Link que o usuário irá clicar
            // MUDE "seusite.com" para o seu domínio real quando hospedar
            $link_reset = "http://localhost/pi/reseta_senha.php?token=" . $token;

            try {
                // Configurações do Servidor (SMTP Gmail)
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'email@gmail.com'; // <-- MUDE AQUI
                $mail->Password   = '123'; // <-- MUDE AQUI
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port       = 465;
                $mail->CharSet    = 'UTF-8';

                // Remetente e Destinatário
                $mail->setFrom('email@gmail.com', 'Identidade'); // <-- MUDE AQUI
                $mail->addAddress($email, $usuario['nome']);

                // Conteúdo do E-mail
                $mail->isHTML(true);
                $mail->Subject = 'Recuperação de Senha - Identidade';
                $mail->Body    = "Olá, " . $usuario['nome'] . ".<br><br>"
                               . "Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha:<br><br>"
                               . "<a href='" . $link_reset . "'>Redefinir Minha Senha</a><br><br>"
                               . "Se você não solicitou isso, por favor, ignore este e-mail.<br>"
                               . "Este link expira em 1 hora.";
                $mail->AltBody = "Olá, " . $usuario['nome'] . ".\n\n"
                               . "Copie e cole o seguinte link no seu navegador para redefinir sua senha:\n"
                               . $link_reset . "\n\n"
                               . "Este link expira em 1 hora.";

                $mail->send();
                
                echo json_encode([
                    "status" => "sucesso", 
                    "mensagem" => "E-mail de recuperação enviado! (Verifique sua caixa de SPAM)."
                ]);

            } catch (Exception $e) {
                echo json_encode([
                    "status" => "erro", 
                    "mensagem" => "Não foi possível enviar o e-mail. Erro: " . $mail->ErrorInfo
                ]);
            }
        }
        $stmt_update->close();
    } else {
        // Por segurança, não informamos que o e-mail não foi encontrado.
        echo json_encode([
            "status" => "sucesso", 
            "mensagem" => "Se o e-mail estiver cadastrado, um link será enviado."
        ]);
    }
    
    $stmt->close();
    $conn->close();
}
?>
