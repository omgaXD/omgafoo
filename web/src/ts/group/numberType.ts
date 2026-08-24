export type FixedArray<T extends number, El = [], Arr extends El[]=[]> = Arr['length'] extends T ? Arr : FixedArray<T, El, [El,...Arr]> 
export type Add<A extends number, B> = B extends number ? [...FixedArray<A>, ...FixedArray<B>]['length'] : A;
export type FixedNumber<T extends number, R = 0, U = never> = R extends T ? U : R | FixedNumber<T, Add<1,R>, U>