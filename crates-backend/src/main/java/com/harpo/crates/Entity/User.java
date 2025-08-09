package com.harpo.crates.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter 
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable=false, unique=true)
    private String email;

    @Lob
    @Column(nullable=false)
    private byte[] authSalt;

    @Lob
    @Column(nullable = false)
    private byte[] encryptSalt;

    @Lob
    @Column(nullable=false)
    private byte[] authHash;

    @OneToMany
    private List<Secrets> secrets;

}
