package com.authproyect.app.Utils;

import org.mindrot.jbcrypt.BCrypt;

public class HasherContrasena {

    public static String encriptarContrasena(String contrasena) {
        int logRounds = 12;
        String salt = BCrypt.gensalt(12);

        return BCrypt.hashpw(contrasena, salt);
    }
}
