import { IRequestHandler } from "@/common/messaging/core/types";

export default class UpdatePackages implements IRequestHandler<UpdatePackageRequest, UpdatePackageResponse>
{
    HandleAsync(request: UpdatePackageRequest): Promise<UpdatePackageResponse> {
        throw new Error("Method not implemented.");
    }
    
}