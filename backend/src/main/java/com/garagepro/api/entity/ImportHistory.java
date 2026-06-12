package com.garagepro.api.entity;

import com.garagepro.api.entity.enums.ImportStatus;
import com.garagepro.api.entity.enums.ImportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ImportType type;

    @Column(name = "file_name", nullable = false, length = 300)
    private String fileName;

    @Column(name = "items_found", nullable = false)
    @Builder.Default
    private Integer itemsFound = 0;

    @Column(name = "created_count", nullable = false)
    @Builder.Default
    private Integer createdCount = 0;

    @Column(name = "updated_count", nullable = false)
    @Builder.Default
    private Integer updatedCount = 0;

    @Column(name = "ignored_count", nullable = false)
    @Builder.Default
    private Integer ignoredCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ImportStatus status = ImportStatus.PROCESSADA;

    @CreationTimestamp
    @Column(name = "imported_at", nullable = false, updatable = false)
    private LocalDateTime importedAt;
}
