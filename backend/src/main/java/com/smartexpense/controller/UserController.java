package com.smartexpense.controller;

import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.dto.response.UserResponse;
import com.smartexpense.entity.User;
import com.smartexpense.exception.BadRequestException;
import com.smartexpense.repository.UserRepository;
import com.smartexpense.service.AuthService;
import com.smartexpense.service.CloudStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final CloudStorageService cloudStorageService;
    private final PasswordEncoder passwordEncoder;

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("currency")) user.setCurrency(body.get("currency"));
        if (body.containsKey("monthlyIncome"))
            user.setMonthlyIncome(new BigDecimal(body.get("monthlyIncome")));
        if (body.containsKey("themePreference"))
            user.setThemePreference(User.ThemePreference.valueOf(body.get("themePreference")));

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(authService.mapToUserResponse(saved)));
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {

        CloudStorageService.UploadResult result = cloudStorageService.uploadAvatar(file, user.getId());
        user.setAvatarUrl(result.url());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("avatarUrl", result.url())));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        String current = body.get("currentPassword");
        String newPwd = body.get("newPassword");

        if (!passwordEncoder.matches(current, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPwd));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
