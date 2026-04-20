// src/main/java/com/example/Shareple/domain/User.java
package com.example.Shareple.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    public enum Role { USER, ADMIN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String kakaoId;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 500)
    private String profileImageUrl;

    private String name;
    private String phone;

    @Column(length = 500)
    private String address;

    /**
     * 사용자 권한. 기존 데이터 호환을 위해 ddl-auto=update 시 MySQL이
     * NOT NULL DEFAULT 'USER' 로 컬럼을 추가하여 기존 행도 자동 USER 로 채워지도록 한다.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20,
            columnDefinition = "VARCHAR(20) NOT NULL DEFAULT 'USER'")
    @Builder.Default
    private Role role = Role.USER;
}
