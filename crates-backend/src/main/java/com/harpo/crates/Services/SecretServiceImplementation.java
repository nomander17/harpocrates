package com.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.harpo.crates.Entity.Secrets;
import com.harpo.crates.Entity.User;
import com.harpo.crates.Repository.SecretRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecretServiceImplementation implements SecretService{
    
    private final SecretRepo secretRepo;

    @Override
    public Secrets saveSecret(Secrets secret) {
        return secretRepo.save(secret);
    }

    @Override
    public List<Secrets> getSecrets(User user) {
        return secretRepo.findByUser(user);
    }

    @Override
    public void deleteSecret(UUID secretId) {
       secretRepo.deleteById(secretId);
    }
}
