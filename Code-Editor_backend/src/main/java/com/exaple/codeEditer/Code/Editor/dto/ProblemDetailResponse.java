package com.exaple.codeEditer.Code.Editor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * RFC 7807 Compliant Problem Details Structure.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProblemDetailResponse {

    private String type;
    private String title;
    private int status;
    private String detail;
    private String instance;
    private Instant timestamp;
    private String correlationId;
    private String requestId;
    private List<InvalidParam> invalidParams;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvalidParam {
        private String name;
        private String reason;
    }
}
