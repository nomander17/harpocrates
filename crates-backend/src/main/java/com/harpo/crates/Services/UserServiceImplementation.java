package com.harpo.crates.Services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.harpo.crates.DTO.CreateUserRequest;
import com.harpo.crates.DTO.UserDTO;
import com.harpo.crates.Entity.User;
import com.harpo.crates.Repository.UserRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService{
    private final UserRepo userRepo;

    @Override
    public UserDTO addUser(CreateUserRequest request)
    {
        User user = User.builder()
                        .email(request.email())
                        .authSalt(request.authSalt())
                        .encryptSalt(request.encryptSalt())
                        .authHash(request.authHash())
                        .build();

        User savedUser = userRepo.save(user);
        return new UserDTO(savedUser.getId(), savedUser.getEmail());
    }

    @Override
    public Optional<UserDTO> findByEmail(String email)
    {
        return userRepo.findByEmail(email)
                       .map(user -> new UserDTO(user.getId(),user.getEmail()));
    }

    @Override
    public Optional<UserDTO> findById(UUID id)
    {
        return userRepo.findById(id)
                       .map(user -> new UserDTO(user.getId(),user.getEmail()));
    }
}
