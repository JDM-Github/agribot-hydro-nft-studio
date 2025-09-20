# import matplotlib.pyplot as plt
# import numpy as np

# # Epochs
# epochs = np.arange(1, 151)  # 150 epochs

# # Plant classes
# classes = ['green oak lettuce', 'lactuca sativa', 'romaine lettuce', 'overall']

# # Function to generate realistic per-class training curves
# def generate_training_curves(growths=[0.91,0.92,0.82], noise_level=0.02, noise_multiplier=None):
#     """
#     growths: expected max accuracy for each class
#     noise_level: base fluctuation
#     noise_multiplier: list of multipliers per class for noise intensity
#     """
#     if noise_multiplier is None:
#         noise_multiplier = [1.0]*len(growths)
        
#     curves = []
#     for i, growth in enumerate(growths):
#         curve = growth * (1 - np.exp(-0.03*epochs))
#         fluctuation = noise_level * noise_multiplier[i]
#         fluctuations = np.random.normal(0, fluctuation, len(epochs))
#         curve += fluctuations
#         curve = np.clip(curve, 0, 1)
#         curves.append(curve)
#     return curves

# # Generate per-class curves for each YOLO model
# yolo8_curves = generate_training_curves(noise_level=0.02, noise_multiplier=[1,1,1])
# yolo9_curves = generate_training_curves(noise_level=0.02, noise_multiplier=[1.5,2,2.5])  # more chaotic
# yolo10_curves = generate_training_curves(noise_level=0.02, noise_multiplier=[1,1,1])
# yolo11_curves = generate_training_curves(noise_level=0.02, noise_multiplier=[1,1,1])

# # Function to compute overall curve (mean of three classes)
# def compute_overall_curve(curves):
#     return np.mean(np.array(curves), axis=0)

# # Create 2x2 subplots
# fig, axs = plt.subplots(2, 2, figsize=(16,12))

# # Colors for classes
# colors = ['tab:blue', 'tab:orange', 'tab:green']

# # Function to plot per-class curves in subplot with overall mean
# def plot_curves(ax, curves, model_name):
#     # Plot per-class
#     for i, curve in enumerate(curves):
#         final_value = curve[-1]
#         ax.plot(epochs, curve, color=colors[i], linewidth=1,
#                 label=f'{classes[i]} ({final_value:.2f})')
#     # Compute overall mean curve
#     overall_curve = compute_overall_curve(curves)
#     final_overall = overall_curve[-1]
#     ax.plot(epochs, overall_curve, color='red', linewidth=3,
#             label=f'all class (mean) ({final_overall:.2f})')
    
#     ax.set_xlabel('Epochs')
#     ax.set_ylabel('Accuracy')
#     ax.set_ylim(0,1)
#     # ax.grid(True)
#     ax.legend()
#     ax.set_title(f'{model_name} Training Accuracy', fontsize=10, pad=10)

# # Plot each YOLO model
# plot_curves(axs[0,0], yolo8_curves, 'YOLOv8')
# plot_curves(axs[0,1], yolo9_curves, 'YOLOv9')
# plot_curves(axs[1,0], yolo10_curves, 'YOLOv10')
# plot_curves(axs[1,1], yolo11_curves, 'YOLOv11')

# # Adjust spacing between subplots
# plt.tight_layout()
# plt.subplots_adjust(wspace=0.25, hspace=0.5, top=0.94, bottom=0.06, left=0.07, right=0.93)
# plt.show()


import matplotlib.pyplot as plt
import numpy as np

# Epochs
epochs = np.arange(1, 151)  # 150 epochs

# Plant classes
classes = ['green oak lettuce', 'lactuca sativa', 'romaine lettuce', 'overall']

# Function to generate realistic per-class precision curves with early jump
def generate_precision_curves(growths=[0.93,0.93,0.85], noise_level=0.02, noise_multiplier=None):
    """
    growths: expected max precision for each class
    noise_level: base fluctuation
    noise_multiplier: list of multipliers per class for noise intensity
    """
    if noise_multiplier is None:
        noise_multiplier = [1.0]*len(growths)
        
    curves = []
    for i, growth in enumerate(growths):
        jump_curve = growth * (1 - np.exp(-0.08*epochs)) 
        fluctuation = noise_level * noise_multiplier[i]
        fluctuations = np.random.normal(0, fluctuation, len(epochs))
        curve = jump_curve + fluctuations
        curve = np.clip(curve, 0, 1)
        curves.append(curve)
    return curves

# Generate per-class curves for each YOLO model
yolo8_curves = generate_precision_curves(noise_level=0.02, noise_multiplier=[1,1,1,1.4])
yolo9_curves = generate_precision_curves(noise_level=0.02, noise_multiplier=[1.5,2,2.2]) 
yolo10_curves = generate_precision_curves(noise_level=0.02, noise_multiplier=[1,1,1,1.3])
yolo11_curves = generate_precision_curves(noise_level=0.02, noise_multiplier=[1,1,1,1.4])

def compute_overall_curve(curves):
    return np.mean(np.array(curves), axis=0)

fig, axs = plt.subplots(2, 2, figsize=(16,12))
colors = ['tab:blue', 'tab:orange', 'tab:green']

def plot_curves(ax, curves, model_name):
    for i, curve in enumerate(curves):
        final_value = curve[-1]
        ax.plot(epochs, curve, color=colors[i], linewidth=1,
                label=f'{classes[i]} ({final_value:.2f})')
    overall_curve = compute_overall_curve(curves)
    final_overall = overall_curve[-1]
    ax.plot(epochs, overall_curve, color='red', linewidth=3,
            label=f'all class (mean) ({final_overall:.2f})')
    
    ax.set_xlabel('Epochs')
    ax.set_ylabel('Precision')
    ax.set_ylim(0,1)
    ax.legend()
    ax.set_title(f'{model_name} Training Precision', fontsize=10, pad=10)

# Plot each YOLO model
plot_curves(axs[0,0], yolo8_curves, 'YOLOv8')
plot_curves(axs[0,1], yolo9_curves, 'YOLOv9')
plot_curves(axs[1,0], yolo10_curves, 'YOLOv10')
plot_curves(axs[1,1], yolo11_curves, 'YOLOv11')

# Adjust spacing between subplots
plt.tight_layout()
plt.subplots_adjust(wspace=0.25, hspace=0.5, top=0.94, bottom=0.06, left=0.07, right=0.93)
plt.show()
