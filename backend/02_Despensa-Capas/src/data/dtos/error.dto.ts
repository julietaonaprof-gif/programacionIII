interface TechDetail {
  techReason: string;
  scope: string;
}

export default interface ErrorDto {
  message: string;
  code: number;
  techDetail?: TechDetail;
}
