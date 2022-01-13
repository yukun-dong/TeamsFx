<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@microsoft/teamsfx](./teamsfx.md) &gt; [getAuthenticationConfigFromEnv](./teamsfx.getauthenticationconfigfromenv.md)

## getAuthenticationConfigFromEnv() function

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Configuration helper function

<b>Signature:</b>

```typescript
export declare function getAuthenticationConfigFromEnv(): AuthenticationConfiguration;
```
<b>Returns:</b>

[AuthenticationConfiguration](./teamsfx.authenticationconfiguration.md)

Authentication configuration which is constructed from predefined env variables.

## Remarks

Used variables: M365\_AUTHORITY\_HOST, M365\_TENANT\_ID, M365\_CLIENT\_ID, M365\_CLIENT\_SECRET, SIMPLE\_AUTH\_ENDPOINT, INITIATE\_LOGIN\_ENDPOINT, M365\_APPLICATION\_ID\_URI
