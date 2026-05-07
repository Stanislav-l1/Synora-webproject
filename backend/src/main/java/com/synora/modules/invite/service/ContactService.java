package com.synora.modules.invite.service;

import com.synora.modules.invite.dto.ContactResponse;
import com.synora.modules.invite.dto.ImportContactsRequest;
import com.synora.modules.invite.entity.UserContact;
import com.synora.modules.invite.repository.UserContactRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final UserContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> importContacts(User owner, ImportContactsRequest req) {
        String source = (req.getSource() == null || req.getSource().isBlank())
                ? "MANUAL" : req.getSource().trim().toUpperCase();

        int imported = 0;
        int matched = 0;
        int skipped = 0;

        for (ImportContactsRequest.ContactEntry entry : req.getContacts()) {
            if (entry == null || entry.getEmail() == null) { skipped++; continue; }
            String email = entry.getEmail().trim().toLowerCase();
            if (email.equalsIgnoreCase(owner.getEmail())) { skipped++; continue; }

            Optional<UserContact> existing =
                    contactRepository.findByUser_IdAndEmailIgnoreCase(owner.getId(), email);

            UserContact contact = existing.orElseGet(() ->
                    UserContact.builder()
                            .user(owner)
                            .email(email)
                            .source(source)
                            .build());

            contact.setName(entry.getName());
            contact.setSource(source);

            User match = userRepository.findByEmail(email).orElse(null);
            if (match != null && !match.getId().equals(owner.getId())) {
                contact.setMatchedUser(match);
                matched++;
            }

            contactRepository.save(contact);
            imported++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported);
        result.put("matched",  matched);
        result.put("skipped",  skipped);
        return result;
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> list(UUID ownerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(contactRepository.findByUser_Id(ownerId, pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> matched(UUID ownerId) {
        return contactRepository.findMatched(ownerId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(User owner, Long contactId) {
        contactRepository.findById(contactId).ifPresent(c -> {
            if (c.getUserId() != null && c.getUserId().equals(owner.getId())) {
                contactRepository.delete(c);
            }
        });
    }

    private ContactResponse toResponse(UserContact c) {
        User m = c.getMatchedUser();
        return ContactResponse.builder()
                .id(c.getId())
                .email(c.getEmail())
                .name(c.getName())
                .source(c.getSource())
                .matchedUserId(m != null ? m.getId() : null)
                .matchedUsername(m != null ? m.getUsername() : null)
                .matchedDisplayName(m != null ? m.getDisplayName() : null)
                .matchedAvatarUrl(m != null ? m.getAvatarUrl() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
