package com.harpo.crates.DTO;

public record CreateUserRequest(
    String email,
    byte[] authSalt,
    byte[] encryptSalt,
    byte[] authHash
) {}
