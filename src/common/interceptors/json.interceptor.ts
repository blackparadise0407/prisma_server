import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class JSONInterceptor implements NestInterceptor {
	intercept(_: ExecutionContext, call$: CallHandler<any>): Observable<any> {
		return call$.handle().pipe(map((data) => classToPlain(data)));
	}
}
