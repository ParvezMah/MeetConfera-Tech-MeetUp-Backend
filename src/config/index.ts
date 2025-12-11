import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    salt_round: process.env.BCRYPT_SALT_ROUND,
    cloudinary: {
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    },
    jwt: {
        jwt_secret: process.env.JWT_ACCESS_SECRET,
        expires_in: process.env.JWT_ACCESS_EXPIRES,
        refresh_token_secret: process.env.JWT_REFRESH_SECRET,
        refresh_token_expires_in: process.env.JWT_REFRESH_EXPIRES,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN
    },
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET_KEY,
}