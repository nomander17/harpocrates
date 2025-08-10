package com.harpo.crates.Services;

import java.util.Optional;
import java.util.UUID;

import com.harpo.crates.DTO.CreateUserRequest;
import com.harpo.crates.DTO.UserDTO;

public interface UserService {
    public UserDTO addUser(CreateUserRequest request);
    Optional<UserDTO> findByEmail(String email);
    Optional<UserDTO> findById(UUID userId);
}
