package com.synora.modules.security.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class TwoFactorService {

    private static final String  BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int     CODE_DIGITS  = 6;
    private static final int     TIME_STEP    = 30;
    private static final int     WINDOW       = 1;

    public String generateSecret() {
        byte[] bytes = new byte[20];
        new SecureRandom().nextBytes(bytes);
        return base32Encode(bytes);
    }

    public String buildOtpAuthUri(String secret, String username, String issuer) {
        String encodedIssuer = urlEncode(issuer);
        String encodedUser   = urlEncode(issuer + ":" + username);
        return "otpauth://totp/" + encodedUser +
               "?secret=" + secret +
               "&issuer=" + encodedIssuer +
               "&algorithm=SHA1&digits=6&period=30";
    }

    public boolean verifyCode(String secret, String code) {
        if (code == null || code.length() != CODE_DIGITS) return false;
        long time = System.currentTimeMillis() / 1000 / TIME_STEP;
        for (int i = -WINDOW; i <= WINDOW; i++) {
            if (generateTotp(secret, time + i).equals(code)) return true;
        }
        return false;
    }

    public List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        SecureRandom rng   = new SecureRandom();
        for (int i = 0; i < 8; i++) {
            int a = 1000 + rng.nextInt(9000);
            int b = 1000 + rng.nextInt(9000);
            codes.add(a + "-" + b);
        }
        return codes;
    }

    public boolean verifyBackupCode(String stored, String code) {
        if (stored == null || code == null) return false;
        String[] codes = stored.split(",");
        return Arrays.asList(codes).contains(code.trim().toUpperCase());
    }

    public String removeBackupCode(String stored, String code) {
        if (stored == null) return "";
        List<String> codes = new ArrayList<>(Arrays.asList(stored.split(",")));
        codes.remove(code.trim().toUpperCase());
        return String.join(",", codes);
    }

    // --- private ---

    private String generateTotp(String secret, long counter) {
        byte[] key  = base32Decode(secret);
        byte[] data = new byte[8];
        long   ctr  = counter;
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) (ctr & 0xFF);
            ctr >>= 8;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash   = mac.doFinal(data);
            int    offset = hash[hash.length - 1] & 0xF;
            int    otp    = ((hash[offset]     & 0x7F) << 24)
                          | ((hash[offset + 1] & 0xFF) << 16)
                          | ((hash[offset + 2] & 0xFF) << 8)
                          |  (hash[offset + 3] & 0xFF);
            return String.format("%0" + CODE_DIGITS + "d", otp % 1_000_000);
        } catch (Exception e) {
            throw new RuntimeException("TOTP generation failed", e);
        }
    }

    private String base32Encode(byte[] bytes) {
        StringBuilder sb     = new StringBuilder();
        int           buffer = 0, bitsLeft = 0;
        for (byte b : bytes) {
            buffer    = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                bitsLeft -= 5;
                sb.append(BASE32_CHARS.charAt((buffer >> bitsLeft) & 0x1F));
            }
        }
        if (bitsLeft > 0) sb.append(BASE32_CHARS.charAt((buffer << (5 - bitsLeft)) & 0x1F));
        return sb.toString();
    }

    private byte[] base32Decode(String encoded) {
        String clean  = encoded.toUpperCase().replaceAll("[=\\s]", "");
        byte[] result = new byte[clean.length() * 5 / 8];
        int    buffer = 0, bitsLeft = 0, idx = 0;
        for (char c : clean.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;
            buffer    = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bitsLeft -= 8;
                if (idx < result.length) result[idx++] = (byte) ((buffer >> bitsLeft) & 0xFF);
            }
        }
        return Arrays.copyOf(result, idx);
    }

    private String urlEncode(String s) {
        return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }
}
