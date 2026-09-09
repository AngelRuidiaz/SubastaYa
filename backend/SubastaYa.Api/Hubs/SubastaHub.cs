using Microsoft.AspNetCore.SignalR;

namespace SubastaYa.Api.Hubs;


public class SubastaHub : Hub
{
    public static string NombreGrupo(int subastaId) => $"subasta-{subastaId}";

    public async Task UnirseASubasta(int subastaId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, NombreGrupo(subastaId));

    public async Task SalirDeSubasta(int subastaId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, NombreGrupo(subastaId));
}
