package com.mediflow.security;

import com.mediflow.entity.User;
import com.mediflow.exception.UnauthorizedAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUser();
        }

        throw new UnauthorizedAccessException("Invalid authentication principal");
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }
}
