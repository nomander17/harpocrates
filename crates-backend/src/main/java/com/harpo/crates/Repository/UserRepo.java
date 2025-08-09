package com.harpo.crates.Repository;
import java.util.Optional;
import java.util.UUID;

import com.harpo.crates.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User,UUID>{
    public Optional<User> findByEmail(String email);
}
