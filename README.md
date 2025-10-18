# Sistema de Avaliação e Gestão de Dispositivos - Backend

Sistema completo desenvolvido em **NestJS** com **MongoDB** para avaliação e gestão de dispositivos eletrônicos, com workflow de submissões, avaliações e políticas de preços dinâmicas.

## 🚀 Funcionalidades

### Módulo Administrativo
- ✅ **Autenticação e Controle de Acesso**: Sistema JWT com roles (Admin/User)
- ✅ **Gestão de Dispositivos**: CRUD completo com especificações e preços base
- ✅ **Configuração de Descontos por Avarias**: Tipos de avarias personalizáveis
- ✅ **Política de Preços Dinâmica**: 
  - Modalidade Venda: Descontos por prazo (7/10/30 dias)
  - Modalidade Troca: Valor integral mantido
- ✅ **Administração de Usuários**: Gestão completa de usuários e permissões
- ✅ **Workflow de Avaliações**: Aprovação/rejeição com emails automáticos

### Módulo do Usuário
- ✅ **Acesso Público**: Catálogo de dispositivos sem necessidade de login
- ✅ **Processo de Submissão**: Submissão anônima ou com conta de usuário
- ✅ **Dashboard Pessoal**: Histórico e acompanhamento de submissões
- ✅ **Tracking System**: Acompanhamento por código de tracking

## 🛠 Tecnologias

- **Framework**: NestJS v10
- **Database**: MongoDB com Mongoose ODM
- **Authentication**: JWT + Passport
- **Validation**: Class Validator + Class Transformer
- **Email**: Nodemailer + Handlebars templates
- **Language**: TypeScript
- **Architecture**: Modular com Guards, Interceptors e Decorators

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm ou yarn

### 1. Configuração do Ambiente

```bash
# Clonar repositório
git clone <repository-url>
cd sistema-avaliacao-dispositivos-backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/device-evaluation-system

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=86400

# Email Configuration  
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Executar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Executar seeder (dados iniciais)
npm run seed
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/api/v1
```

### Autenticação

#### POST `/auth/register`
Registrar novo usuário
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123456",
  "role": "user" // opcional, default: user
}
```

#### POST `/auth/login`
Fazer login
```json
{
  "email": "usuario@email.com",
  "password": "senha123456"
}
```

### Dispositivos (Público)

#### GET `/devices/public`
Listar dispositivos ativos (catálogo público)
- Query params: `name`, `brand`, `model`, `minPrice`, `maxPrice`, `page`, `limit`

#### GET `/devices/public/:id`
Detalhes de um dispositivo específico

### Submissões

#### POST `/device-submissions/public`
Submissão anônima
```json
{
  "deviceId": "device_id",
  "contactName": "Nome do Contato",
  "contactEmail": "contato@email.com",
  "contactPhone": "11999999999",
  "deviceSerialNumber": "ABC123456",
  "reportedCondition": "good",
  "preferredSaleMode": "sale",
  "userNotes": "Observações opcionais"
}
```

#### POST `/device-submissions` (Autenticado)
Submissão com usuário logado
```json
{
  "deviceId": "device_id",
  "deviceSerialNumber": "ABC123456", 
  "reportedCondition": "good",
  "preferredSaleMode": "sale",
  "userNotes": "Observações opcionais"
}
```

#### GET `/device-submissions/track/:trackingCode`
Acompanhar submissão por código de tracking

### Administração (Requer autenticação Admin)

#### Dispositivos
- `POST /devices` - Criar dispositivo
- `GET /devices` - Listar todos dispositivos
- `GET /devices/:id` - Buscar dispositivo
- `PATCH /devices/:id` - Atualizar dispositivo
- `DELETE /devices/:id` - Excluir dispositivo

#### Tipos de Avarias
- `POST /damage-types` - Criar tipo de avaria
- `GET /damage-types` - Listar tipos de avarias
- `PATCH /damage-types/:id` - Atualizar tipo
- `DELETE /damage-types/:id` - Excluir tipo

#### Políticas de Preços
- `POST /pricing-policies` - Criar política
- `GET /pricing-policies` - Listar políticas
- `PATCH /pricing-policies/:id` - Atualizar política
- `DELETE /pricing-policies/:id` - Excluir política

#### Avaliações
- `POST /evaluations` - Criar avaliação
- `PATCH /evaluations/:id/approve` - Aprovar avaliação
- `PATCH /evaluations/:id/reject` - Rejeitar avaliação
- `GET /evaluations/stats` - Estatísticas

## 🏗 Arquitetura

### Estrutura de Pastas
```
src/
├── auth/              # Autenticação e autorização
├── users/             # Gestão de usuários
├── devices/           # Catálogo de dispositivos
├── damage-types/      # Tipos de avarias
├── pricing-policies/  # Políticas de preços
├── device-submissions/ # Submissões de dispositivos
├── evaluations/       # Avaliações
├── email/             # Serviço de emails
├── common/            # Utilitários compartilhados
├── config/            # Configurações
└── database/          # Seeds e configurações DB
```

### Fluxo Principal

1. **Submissão**: Usuário submete dispositivo (anônimo ou logado)
2. **Tracking**: Sistema gera código de acompanhamento
3. **Avaliação**: Admin cria avaliação com cálculo de preços
4. **Aprovação/Rejeição**: Admin aprova ou rejeita a avaliação
5. **Notificação**: Email automático para o usuário
6. **Expiração**: Avaliações aprovadas têm prazo de validade

### Cálculo de Preços

```
Preço Final = (Preço Base - Descontos por Avarias) - Desconto por Modalidade/Prazo
```

## 🔒 Segurança

- **JWT Authentication**: Tokens com expiração configurável
- **RBAC**: Controle de acesso baseado em roles
- **Validation**: Validação rigorosa de entrada com class-validator
- **CORS**: Configuração adequada para ambiente de produção
- **Password Hashing**: bcryptjs com salt de 12 rounds

## 📧 Sistema de Emails

Templates automáticos para:
- Confirmação de submissão
- Avaliação aprovada com valores
- Avaliação rejeitada com motivos
- Notificações administrativas

## 🎯 Enums Importantes

```typescript
// Roles de usuário
enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Status de avaliação  
enum EvaluationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Modalidades de venda
enum SaleMode {
  SALE = 'sale',      // Venda
  EXCHANGE = 'exchange' // Troca
}

// Prazos de pagamento
enum PaymentTiming {
  SEVEN_DAYS = 'seven_days',   // 7 dias
  TEN_DAYS = 'ten_days',       // 10 dias  
  THIRTY_DAYS = 'thirty_days'  // 30 dias
}
```

## 🚀 Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables para Produção
- Alterar `JWT_SECRET` para valor seguro
- Configurar `MONGODB_URI` para MongoDB Atlas ou instância produção
- Configurar `EMAIL_*` com provider de produção (SendGrid, SES, etc.)
- Definir `FRONTEND_URL` com domínio correto

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Scripts Disponíveis

```bash
npm run build          # Build para produção
npm run start:dev       # Desenvolvimento com hot-reload
npm run start:debug     # Debug mode
npm run start:prod      # Produção
npm run seed            # Executar seeder
npm run lint            # ESLint
npm run format          # Prettier
```

## 👥 Dados Iniciais (Seeder)

O script de seeder cria:
- Usuário admin: `admin@sistema.com` / `admin123456`
- Tipos de avarias básicos (tela trincada, bateria, etc.)
- Políticas de preços padrão
- Dispositivos de exemplo

## 🤝 Contribuição

1. Fork o projeto
2. Crie feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/NovaFuncionalidade`)
5. Abra Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.
