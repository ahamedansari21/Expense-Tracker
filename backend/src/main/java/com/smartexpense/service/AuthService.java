package com.smartexpense.service;

import com.smartexpense.dto.request.LoginRequest;
import com.smartexpense.dto.request.RegisterRequest;
import com.smartexpense.dto.response.AuthResponse;
import com.smartexpense.dto.response.UserResponse;
import com.smartexpense.entity.RefreshToken;
import com.smartexpense.entity.User;
import com.smartexpense.exception.BadRequestException;
import com.smartexpense.exception.UnauthorizedException;
import com.smartexpense.repository.RefreshTokenRepository;
import com.smartexpense.repository.UserRepository;
import com.smartexpense.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered. Please login.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .phone(request.getPhone())
                .emailVerified(true)

                // ✅ FIX: DEFAULT VALUES (THIS WAS CAUSING YOUR ERROR)
                .role(User.Role.USER)
                .provider(User.Provider.LOCAL)
                .themePreference(User.ThemePreference.LIGHT)

                .build();

        user = userRepository.save(user);

        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        User user = token.getUser();

        refreshTokenRepository.delete(token);

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User {} logged out", userId);
    }

    private AuthResponse buildAuthResponse(User user) {

        String accessToken = tokenProvider.generateToken(user);
        String refreshTokenStr = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(mapToUserResponse(user))
                .build();
    }

    private String createRefreshToken(User user) {

        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .build();

        return refreshTokenRepository.save(refreshToken).getToken();
    }

    public UserResponse mapToUserResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .currency(user.getCurrency())
                .monthlyIncome(user.getMonthlyIncome())

                // ✅ SAFE NULL HANDLING (IMPORTANT FIX)
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .provider(user.getProvider() != null ? user.getProvider().name() : "LOCAL")
                .themePreference(user.getThemePreference() != null ? user.getThemePreference().name() : "LIGHT")

                .createdAt(user.getCreatedAt())
                .build();
    }
}