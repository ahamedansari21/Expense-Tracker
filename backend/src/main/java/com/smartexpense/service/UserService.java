package com.smartexpense.service;

import com.smartexpense.dto.response.UserResponse;
import com.smartexpense.entity.User;
import com.smartexpense.exception.ResourceNotFoundException;
import com.smartexpense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public UserResponse updateProfile(Long userId, Map<String, String> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updates.containsKey("fullName"))    user.setFullName(updates.get("fullName"));
        if (updates.containsKey("phone"))       user.setPhone(updates.get("phone"));
        if (updates.containsKey("currency"))    user.setCurrency(updates.get("currency"));
        if (updates.containsKey("monthlyIncome"))
            user.setMonthlyIncome(new BigDecimal(updates.get("monthlyIncome")));
        if (updates.containsKey("themePreference"))
            user.setThemePreference(User.ThemePreference.valueOf(updates.get("themePreference")));

        return authService.mapToUserResponse(userRepository.save(user));
    }

    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return authService.mapToUserResponse(user);
    }
}
