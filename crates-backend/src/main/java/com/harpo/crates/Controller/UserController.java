package com.harpo.crates.Controller;

import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.harpo.crates.DTO.CreateUserRequest;
import com.harpo.crates.DTO.UserDTO;
import com.harpo.crates.Services.UserService;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    
    @PostMapping("path")
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        UserDTO created = userService.addUser(request);       
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("path")
    public ResponseEntity<Optional<UserDTO>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }    
}
