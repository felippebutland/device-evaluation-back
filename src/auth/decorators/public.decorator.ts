// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// src/auth/decorators/roles.decorator.ts


// src/auth/decorators/current-user.decorator.ts

// src/auth/decorators/optional-auth.decorator.ts
