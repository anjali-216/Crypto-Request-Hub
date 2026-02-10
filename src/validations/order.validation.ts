import Joi from 'joi';

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const requestOrderSchema = Joi.object({
    amount: Joi.string().required().messages({
        'any.required': 'Amount is required'
    }),
    walletAddress: Joi.string().regex(ethAddressRegex).required().messages({
        'string.pattern.base': 'A valid Ethereum wallet address is required',
        'any.required': 'Wallet address is required'
    })
});
