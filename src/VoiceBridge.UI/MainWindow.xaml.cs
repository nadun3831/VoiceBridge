using System.Windows;
using Serilog;
using VoiceBridge.Application.ViewModels;

namespace VoiceBridge.UI;

public partial class MainWindow : Window
{
    public MainViewModel ViewModel { get; }

    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        ViewModel = viewModel;
        DataContext = ViewModel;
        Log.Information("MainWindow initialized with MainViewModel DataContext.");
    }
}
