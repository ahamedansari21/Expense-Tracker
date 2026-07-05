package com.smartexpense.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudStorageService {

    private final Cloudinary cloudinary;

    public UploadResult uploadReceipt(MultipartFile file, Long userId) {
        try {
            String publicId = "receipts/" + userId + "/" + UUID.randomUUID();
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "smart-expense/receipts",
                            "resource_type", "auto",
                            "transformation", "f_auto,q_auto"
                    ));
            return new UploadResult(
                    result.get("secure_url").toString(),
                    result.get("public_id").toString()
            );
        } catch (IOException e) {
            log.error("Failed to upload receipt: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public UploadResult uploadAvatar(MultipartFile file, Long userId) {
        try {
            String publicId = "avatars/" + userId;
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "smart-expense/avatars",
                            "overwrite", true,
                            "transformation", "w_200,h_200,c_fill,f_auto,q_auto"
                    ));
            return new UploadResult(
                    result.get("secure_url").toString(),
                    result.get("public_id").toString()
            );
        } catch (IOException e) {
            log.error("Failed to upload avatar: {}", e.getMessage());
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }

    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", publicId, e.getMessage());
        }
    }

    public record UploadResult(String url, String publicId) {}
}
