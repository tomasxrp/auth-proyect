package com.authproyect.app.Utils;

import org.mindrot.jbcrypt.BCrypt;

public class VerificadorContrasena {
    public static boolean validarContrasena(String contrasena, String contrasenaHash) {
        return BCrypt.checkpw(contrasena, contrasenaHash);
    }
}
