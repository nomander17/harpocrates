package com.harpo.crates.Entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="secrets")
public class Secrets {
    @Id
    @GeneratedValue
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;
    
    @Lob
    @Column(nullable=false)
    private byte[] titleEncrypted;

    @Lob
    @Column(nullable=false)
    private byte[] ivTitle;
    
    @Lob
    @Column(nullable=false)
    private byte[] bodyEncrypted;

    @Lob
    @Column(nullable=false)
    private byte[] ivBody;

    @Column(nullable=false)
    private LocalDateTime createdAt;
}
