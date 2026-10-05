import type {
  AudiovisualAsset,
  Campana,
  Canal,
  Contenido,
  EmpresaProspecto,
  Etiqueta,
  Lead,
  Meta,
  Producto,
  PublicacionMarketplace,
  Tarea,
  User,
  WhatsappConversation,
} from "@rgr/shared";

export type LeadInput = Omit<Lead, "id">;
export type ProspectInput = Omit<EmpresaProspecto, "id">;
export type CampaignInput = Omit<Campana, "id" | "metricas"> & { metricas?: Campana["metricas"] };
export type ContentInput = Omit<Contenido, "id">;
export type TaskInput = Omit<Tarea, "id">;
export type MarketplaceInput = Omit<PublicacionMarketplace, "id">;

export interface LeadsRepo {
  list(): Lead[];
  create(input: LeadInput): Lead;
  update(id: string, changes: Partial<Lead>): void;
  updateStatus(id: string, status: Lead["estado"]): void;
  remove(id: string): void;
}

export interface ContenidoRepo {
  list(): Contenido[];
  create(input: ContentInput): Contenido;
  update(id: string, changes: Partial<Contenido>): void;
  move(id: string, fechaProgramada: string): void;
  remove(id: string): void;
}

export interface CampanasRepo {
  list(): Campana[];
  create(input: CampaignInput): Campana;
  update(id: string, changes: Partial<Campana>): void;
  setStatus(id: string, status: Campana["estado"]): void;
  remove(id: string): void;
}

export interface ProspeccionRepo {
  list(): EmpresaProspecto[];
  create(input: ProspectInput): EmpresaProspecto;
  update(id: string, changes: Partial<EmpresaProspecto>): void;
  remove(id: string): void;
}

export interface CatalogoRepo {
  productos(): Producto[];
  usuarios(): User[];
  canales(): Canal[];
  etiquetas(): Etiqueta[];
  metas(): Meta[];
  createProducto(input: Omit<Producto, "id">): Producto;
  updateProducto(id: string, changes: Partial<Producto>): void;
  removeProducto(id: string): void;
  createUsuario(input: Omit<User, "id">): User;
  updateUsuario(id: string, changes: Partial<User>): void;
  removeUsuario(id: string): void;
  createCanal(input: Omit<Canal, "id">): Canal;
  updateCanal(id: string, changes: Partial<Canal>): void;
  removeCanal(id: string): void;
  createEtiqueta(input: Omit<Etiqueta, "id">): Etiqueta;
  updateEtiqueta(id: string, changes: Partial<Etiqueta>): void;
  removeEtiqueta(id: string): void;
  createMeta(input: Omit<Meta, "id">): Meta;
  updateMeta(id: string, changes: Partial<Meta>): void;
  removeMeta(id: string): void;
}

export interface TareasRepo {
  list(): Tarea[];
  create(input: TaskInput): Tarea;
  update(id: string, changes: Partial<Tarea>): void;
  remove(id: string): void;
}

export interface MarketplaceRepo {
  list(): PublicacionMarketplace[];
  create(input: MarketplaceInput): PublicacionMarketplace;
  update(id: string, changes: Partial<PublicacionMarketplace>): void;
  setStatus(id: string, status: PublicacionMarketplace["estado"]): void;
  remove(id: string): void;
}

export interface WhatsAppRepo {
  list(): WhatsappConversation[];
  setLabel(id: string, etiquetaId: string): void;
  markFirstResponse(id: string, at: string): void;
}

export interface AudiovisualRepo {
  list(): AudiovisualAsset[];
  create(input: Omit<AudiovisualAsset, "id" | "vecesUsado">): AudiovisualAsset;
  update(id: string, changes: Partial<AudiovisualAsset>): void;
  markUsed(id: string): void;
  remove(id: string): void;
}
