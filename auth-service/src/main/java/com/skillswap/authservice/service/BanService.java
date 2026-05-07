package com.skillswap.authservice.service;

import com.skillswap.authservice.repository.UserBanRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class BanService {

    private final UserBanRepository userBanRepository;

    public boolean isCurrentlyBanned(UUID userId) {
        return userBanRepository.findByUserId(userId)
                .map(ban -> !ban.isExpired())
                .orElse(false);
    }
}
