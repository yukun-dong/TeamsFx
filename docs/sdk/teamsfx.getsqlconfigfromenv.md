<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@microsoft/teamsfx](./teamsfx.md) &gt; [getSqlConfigFromEnv](./teamsfx.getsqlconfigfromenv.md)

## getSqlConfigFromEnv() function

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Configuration helper function

<b>Signature:</b>

```typescript
export declare function getSqlConfigFromEnv(): SqlConfiguration;
```
<b>Returns:</b>

[SqlConfiguration](./teamsfx.sqlconfiguration.md)

SQL configuration which is constructed from predefined env variables.

## Remarks

Used variables: SQL\_ENDPOINT, SQL\_USER\_NAME, SQL\_PASSWORD, SQL\_DATABASE\_NAME, IDENTITY\_ID
