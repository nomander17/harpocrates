package com.harpo.crates.Services;

import java.util.List;
import java.util.UUID;

import com.harpo.crates.Entity.Secrets;
import com.harpo.crates.Entity.User;

public interface SecretService {
    Secrets saveSecret(Secrets secret);
    List<Secrets> getSecrets(User user);
    void deleteSecret(UUID secretId);
}
