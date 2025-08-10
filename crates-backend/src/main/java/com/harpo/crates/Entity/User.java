package com.harpo.crates.Entity;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
