package com.exaple.codeEditer.Code.Editor.dto.piston;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteResponse {
    private String stdout;
    private String stderr;
    private String compileOutput;
    private String status;
    private Integer exitCode;
    private String time;
    private String memory;
}
