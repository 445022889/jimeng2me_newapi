import _ from 'lodash';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import { tokenSplit } from '@/api/controllers/core.ts';
import { createCompletion, createCompletionStream } from '@/api/controllers/chat.ts';

export default {

    prefix: '/v1/chat',

    post: {

        '/completions': async (request: Request) => {
            request
                .validate('body.model', v => _.isUndefined(v) || _.isString(v))
                .validate('body.messages', _.isArray)
                .validate('body.image_config', v => _.isUndefined(v) || _.isObject(v))
                .validate('body.imageConfig', v => _.isUndefined(v) || _.isObject(v))
                .validate('body.image_config.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.image_config.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.image_config.intelligent_ratio', v => _.isUndefined(v) || _.isBoolean(v))
                .validate('body.image_config.sample_strength', v => _.isUndefined(v) || _.isFinite(v))
                .validate('body.image_config.negative_prompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.imageConfig.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.imageConfig.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.imageConfig.intelligentRatio', v => _.isUndefined(v) || _.isBoolean(v))
                .validate('body.imageConfig.sampleStrength', v => _.isUndefined(v) || _.isFinite(v))
                .validate('body.imageConfig.negativePrompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.images', v => _.isUndefined(v) || _.isArray(v))
                .validate('headers.authorization', _.isString)
            // refresh_token切分
            const tokens = tokenSplit(request.headers.authorization);
            // 随机挑选一个refresh_token
            const token = _.sample(tokens);
            const { model, messages, stream, image_config, imageConfig, images } = request.body;
            if (stream) {
                const stream = await createCompletionStream(messages, token, model, {
                    imageConfig: image_config || imageConfig,
                    images,
                });
                return new Response(stream, {
                    type: "text/event-stream"
                });
            }
            else
                return await createCompletion(messages, token, model, {
                    imageConfig: image_config || imageConfig,
                    images,
                });
        }

    }

}
