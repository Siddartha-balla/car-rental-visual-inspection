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
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            BCryptPasswordEncoder encoder
    ) {
        return args -> {

            // --------- ADMIN ----------
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@gmail.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setActive(true);

                userRepository.save(admin);
                System.out.println("✅ Default ADMIN created");
            }

            // --------- DEALER (Sample) ----------
            if (userRepository.findByEmail("dealer@gmail.com").isEmpty()) {
                User dealer = new User();
                dealer.setName("Default Dealer");
                dealer.setEmail("dealer@gmail.com");
                dealer.setPassword(encoder.encode("dealer123"));
                dealer.setRole("DEALER");
                dealer.setActive(true);

                userRepository.save(dealer);
                System.out.println("✅ Sample DEALER created");
            }
        };
    }
}
