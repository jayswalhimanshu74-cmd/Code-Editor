package com.exaple.codeEditer.Code.Editor.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedisMessageDto {
    private String destination;
    private String payloadJson;
}
