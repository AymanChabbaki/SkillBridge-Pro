
import swaggerJsdoc from 'swagger-jsdoc';
// @ts-ignore - JS config file without type declarations
import swaggerConfig from '../../swagger.config';

const swaggerSpec = swaggerJsdoc(swaggerConfig);
export default swaggerSpec;
