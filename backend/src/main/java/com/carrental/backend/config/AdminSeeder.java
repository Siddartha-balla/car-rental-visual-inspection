package com.carrental.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.carrental.backend.model.User;
import com.carrental.backend.repository.UserRepository;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            BCryptPasswordEncoder encoder
    ) {
        return args -> {
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@gmail.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ADMIN");

                userRepository.save(admin);
                System.out.println("✅ Default admin created");
            }
        };
    }
}
