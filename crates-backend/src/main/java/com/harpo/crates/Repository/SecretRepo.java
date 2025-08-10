package com.harpo.crates.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.harpo.crates.Entity.Secrets;
import com.harpo.crates.Entity.User;

public interface SecretRepo extends JpaRepository<Secrets,UUID> {
    List<Secrets> findByUser(User user);
}
