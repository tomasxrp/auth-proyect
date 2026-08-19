package com.authproyect.app.Service;


import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void enviarCorreoBienvenida(String correoDestinatario){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("authproyect@no-reply.cl");
        message.setTo(correoDestinatario);
        message.setSubject("Bienvenido al sistema de auth!!!");
        message.setText("Hola,\n\nTu cuenta ha sido creada exitosamente.\n¡Gracias por registrarte!");

        mailSender.send(message);
    }

}
