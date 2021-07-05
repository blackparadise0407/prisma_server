import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { isArray, mapKeys, snakeCase } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map((value) => {
				const snakeCaseMapper = (val) => mapKeys(val, (_v, k) => snakeCase(k));
				if (isArray(value)) {
					return value.map((v) => snakeCaseMapper(v));
				}
				return snakeCaseMapper(value);
			}),
		);
	}
}
