package org.booklore.model.dto.settings;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicAppSetting {
    private boolean oidcEnabled;
    private boolean remoteAuthEnabled;
    private boolean aiEnabled;
    private OidcProviderDetails oidcProviderDetails;
    private boolean oidcForceOnlyMode;
}