/**
 * User Mapper
 * Maps between UserModel (DTO) and UserEntity (Domain)
 */
import { UserEntity } from "../../domain/entities/User.entity";

export interface UserModel {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dni: string;
  cuit_cuil: string;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  web_access_enabled: boolean;
  created_at: string;
  updated_at: string;
  photo_url?: string | null;
}

export class UserMapper {
  static toDomain(model: UserModel): UserEntity {
    return new UserEntity(
      model.id,
      model.email,
      model.first_name,
      model.last_name,
      model.phone,
      model.dni,
      model.cuit_cuil,
      model.verification_status,
      model.web_access_enabled,
      new Date(model.created_at),
      new Date(model.updated_at),
      model.photo_url,
    );
  }

  static toModel(entity: UserEntity): UserModel {
    return {
      id: entity.id,
      email: entity.email,
      first_name: entity.firstName,
      last_name: entity.lastName,
      phone: entity.phone,
      dni: entity.dni,
      cuit_cuil: entity.cuitCuil,
      verification_status: entity.verificationStatus,
      web_access_enabled: entity.webAccessEnabled,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      photo_url: entity.photoUrl,
    };
  }

  static toDomainArray(models: UserModel[]): UserEntity[] {
    return models.map((model) => this.toDomain(model));
  }
}
